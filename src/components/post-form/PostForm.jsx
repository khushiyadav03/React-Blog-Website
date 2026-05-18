import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const FEATURED_IMAGE_ASPECT = 16 / 9;

export default function PostForm({ post }) {
    // Same form add aur edit dono ke liye use ho raha hai.
    // Agar post mila hai to existing values fill hongi, warna empty form rahega.
    const { register, handleSubmit, setValue, control, getValues, formState: { isSubmitting, errors } } = useForm({
        defaultValues: {
            title: post?.title || "",
            slug: post?.$id || "",
            content: post?.content || "",
            status: post?.status || "active",
            excerpt: post?.excerpt || "",
            tags: Array.isArray(post?.tags) ? post.tags.join(", ") : post?.tags || "",
        },
    });

    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const [formError, setFormError] = useState("");
    const [isDraggingImage, setIsDraggingImage] = useState(false);
    const [imageSize, setImageSize] = useState(null);
    const [cropSelection, setCropSelection] = useState({ x: 10, y: 10, width: 80 });
    const currentImageId = post?.featuredImage || post?.featuredimage || post?.image;
    const currentImageUrl = appwriteService.getFileView(currentImageId);
    const titleValue = useWatch({ control, name: "title" });
    const selectedImage = useWatch({ control, name: "image" });
    const imageInput = register("image", {
        required: post ? false : "Please add a featured image before publishing.",
    });
    const imagePreview = useMemo(() => {
        const file = selectedImage?.[0];
        return file ? URL.createObjectURL(file) : "";
    }, [selectedImage]);
    const cropHeight = useMemo(() => {
        if (!imageSize) return 45;
        return (cropSelection.width * (imageSize.width / imageSize.height)) / FEATURED_IMAGE_ASPECT;
    }, [cropSelection.width, imageSize]);

    useEffect(() => () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
    }, [imagePreview]);

    const getCropHeight = (width, size) => {
        if (!size) return 45;
        return (width * (size.width / size.height)) / FEATURED_IMAGE_ASPECT;
    };

    const getMaxCropWidth = (size) => {
        if (!size) return 100;
        const imageAspect = size.width / size.height;
        return Math.min(100, (100 * FEATURED_IMAGE_ASPECT) / imageAspect);
    };

    const clampCrop = (crop, size) => {
        const maxWidth = getMaxCropWidth(size);
        const width = Math.max(20, Math.min(crop.width, maxWidth));
        const height = getCropHeight(width, size);

        return {
            width,
            x: Math.max(0, Math.min(crop.x, 100 - width)),
            y: Math.max(0, Math.min(crop.y, 100 - height)),
        };
    };

    const resizeFeaturedImage = async (file) => {
        if (!file) return null;

        const targetWidth = 1600;
        const targetHeight = 900;
        const imageUrl = URL.createObjectURL(file);

        try {
            const image = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = imageUrl;
            });

            const canvas = document.createElement("canvas");
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const context = canvas.getContext("2d");
            const crop = clampCrop(cropSelection, { width: image.width, height: image.height });
            const height = getCropHeight(crop.width, { width: image.width, height: image.height });
            const sourceX = (crop.x / 100) * image.width;
            const sourceY = (crop.y / 100) * image.height;
            const sourceWidth = (crop.width / 100) * image.width;
            const sourceHeight = (height / 100) * image.height;

            context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, targetWidth, targetHeight);

            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, "image/jpeg", 0.9);
            });

            return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-featured.jpg`, {
                type: "image/jpeg",
            });
        } finally {
            URL.revokeObjectURL(imageUrl);
        }
    };

    const setDroppedImage = (files) => {
        if (!files?.length) return;
        setCropSelection({ x: 10, y: 10, width: 80 });
        setValue("image", files, { shouldValidate: true });
    };

    const updateCropPosition = (event) => {
        if (!imageSize) return;

        const rect = event.currentTarget.getBoundingClientRect();
        const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
        const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
        const height = getCropHeight(cropSelection.width, imageSize);

        setCropSelection((crop) => clampCrop({
            ...crop,
            x: pointerX - crop.width / 2,
            y: pointerY - height / 2,
        }, imageSize));
    };

    const submit = async (data) => {
        setFormError("");

        const normalizedData = {
            ...data,
            slug: slugTransform(data.slug || data.title),
        };

        try {
            if (post) {
                // Edit mode: agar new image select ki hai to pehle upload karte hain.
                const preparedImage = normalizedData.image?.[0] ? await resizeFeaturedImage(normalizedData.image[0]) : null;
                const file = preparedImage ? await appwriteService.uploadFile(preparedImage) : null;

                if (preparedImage && !file) {
                    setFormError("Image upload failed. Please try again with a smaller image.");
                    return;
                }

                if (file) {
                    // New image upload ho gayi to old featured image delete kar dete hain.
                    appwriteService.deleteFile(post.featuredImage);
                }

                // Post update karte hain; image change nahi hui to featuredImage undefined rahega.
                const dbPost = await appwriteService.updatePost(post.$id, {
                    ...normalizedData,
                    tags: normalizedData.tags ? normalizedData.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
                    featuredImage: file ? file.$id : undefined,
                });

                if (dbPost) {
                    // Update ke baad post detail page par redirect karte hain.
                    navigate(`/post/${dbPost.$id}`);
                    return;
                }

                setFormError("Post could not be saved. Please check your Appwrite permissions and try again.");
            } else {
                // Add mode: new post create karne se pehle image upload karna zaroori hai.
                const preparedImage = await resizeFeaturedImage(normalizedData.image?.[0]);
                const file = preparedImage ? await appwriteService.uploadFile(preparedImage) : null;

                if (!file) {
                    setFormError("Image upload failed. Please choose a featured image and try again.");
                    return;
                }

                normalizedData.featuredImage = file.$id;

                // Current logged-in user ki ID ke saath post create hota hai.
                const dbPost = await appwriteService.createPost({
                    ...normalizedData,
                    tags: normalizedData.tags ? normalizedData.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
                    userID: userData.$id,
                });

                if (dbPost) {
                    navigate(`/post/${dbPost.$id}`);
                    return;
                }

                setFormError("Post could not be published. Please check your Appwrite permissions and try again.");
            }
        } catch {
            setFormError("Something went wrong while publishing. Please try again.");
        }
    };

    const handleInvalidSubmit = (invalidFields) => {
        const firstError = invalidFields.image?.message || invalidFields.title?.message || invalidFields.slug?.message || "Please complete the required fields.";
        setFormError(firstError);
    };

    const slugTransform = useCallback((value) => {
        // Title ko URL-friendly slug me convert karte hain.
        if (value && typeof value === "string") {
            const slug = value
                .trim()
                .toLowerCase()
                .replace(/[^a-zA-Z\d\s._-]+/g, "-")
                .replace(/\s+/g, "-")
                .replace(/^[._-]+/, "")
                .replace(/[._-]+$/, "")
                .slice(0, 36);

            return slug || "post";
        }

        return "post";
    }, []);

    useEffect(() => {
        // Title change hote hi slug automatically update hota rahega.
        setValue("slug", slugTransform(titleValue), { shouldValidate: true });
    }, [titleValue, slugTransform, setValue]);

    return (
        <form onSubmit={handleSubmit(submit, handleInvalidSubmit)} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
                <Input
                    label="Title :"
                    placeholder="Title"
                    className="mb-4"
                    {...register("title", { required: "Please add a title." })}
                />
                <Input
                    label="Slug :"
                    placeholder="Slug"
                    className="mb-4"
                    {...register("slug", { required: "Please add a slug." })}
                    onInput={(e) => {
                        // Manual slug edit par bhi same slug format maintain karte hain.
                        setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
                    }}
                />
                <div className="mb-4">
                    <label className="mb-1 inline-block pl-1 text-sm font-medium text-slate-700">Excerpt</label>
                    <textarea
                        rows="3"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-950 outline-none duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        placeholder="Short summary for cards and previews"
                        {...register("excerpt")}
                    />
                </div>
                <RTE label="Content :" name="content" control={control} defaultValue={getValues("content")} />
            </div>
            <aside className="rounded-2xl border border-slate-200 bg-stone-50 p-4">
                <h2 className="mb-4 text-base font-bold text-slate-950">Publishing settings</h2>
                <div className="mb-4">
                    <label className="mb-1 inline-block pl-1 text-sm font-medium text-slate-700">Featured image</label>
                    <div
                        onDragOver={(event) => {
                            event.preventDefault();
                            setIsDraggingImage(true);
                        }}
                        onDragLeave={() => setIsDraggingImage(false)}
                        onDrop={(event) => {
                            event.preventDefault();
                            setIsDraggingImage(false);
                            setDroppedImage(event.dataTransfer.files);
                        }}
                        className={`rounded-2xl border border-dashed p-4 text-center transition ${
                            isDraggingImage ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white"
                        }`}
                    >
                        <input
                            type="file"
                            accept="image/png, image/jpg, image/jpeg, image/gif, image/webp"
                            className="hidden"
                            id="featured-image"
                            {...imageInput}
                            onChange={(event) => {
                                setImageSize(null);
                                setCropSelection({ x: 10, y: 10, width: 80 });
                                imageInput.onChange(event);
                            }}
                        />
                        <label htmlFor="featured-image" className="block cursor-pointer">
                            <span className="block text-sm font-bold text-slate-950">Drop image here or choose a file</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                                Select the exact 16:9 area you want to show, then it is resized to 1600 x 900.
                            </span>
                        </label>
                    </div>
                    {errors.image?.message && <p className="mt-2 text-sm font-medium text-red-600">{errors.image.message}</p>}
                </div>
                {(imagePreview || currentImageUrl) && (
                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="bg-stone-100 p-3">
                        <div
                            className="relative w-full cursor-crosshair overflow-hidden rounded-xl bg-slate-950/5"
                            style={{ aspectRatio: imageSize ? `${imageSize.width} / ${imageSize.height}` : "16 / 9" }}
                            onClick={updateCropPosition}
                            onPointerMove={(event) => {
                                if (event.buttons === 1) updateCropPosition(event);
                            }}
                        >
                            <img
                                src={imagePreview || currentImageUrl}
                                alt="Featured preview"
                                className="h-full w-full object-contain"
                                onLoad={(event) => {
                                    const size = {
                                        width: event.currentTarget.naturalWidth,
                                        height: event.currentTarget.naturalHeight,
                                    };
                                    const maxWidth = getMaxCropWidth(size);
                                    const width = Math.min(80, maxWidth);
                                    const height = getCropHeight(width, size);

                                    setImageSize(size);
                                    setCropSelection({
                                        width,
                                        x: (100 - width) / 2,
                                        y: (100 - height) / 2,
                                    });
                                }}
                            />
                            <div
                                className="absolute border-2 border-emerald-400 bg-emerald-400/10 shadow-[0_0_0_9999px_rgba(15,23,42,0.55)]"
                                style={{
                                    left: `${cropSelection.x}%`,
                                    top: `${cropSelection.y}%`,
                                    width: `${cropSelection.width}%`,
                                    height: `${cropHeight}%`,
                                }}
                            />
                            <div className="absolute inset-x-3 bottom-3 rounded-full bg-slate-950/75 px-3 py-1 text-center text-xs font-semibold text-white">
                                Click or drag to move the crop window
                            </div>
                        </div>
                        </div>
                        <div className="border-t border-slate-100 px-3 py-2 text-xs font-medium text-slate-500">
                            Only the highlighted 16:9 area will be used for post cards and article headers.
                        </div>
                        <div className="grid gap-3 border-t border-slate-100 p-3">
                            <label className="text-xs font-bold uppercase tracking-wide text-slate-500">Crop size</label>
                            <input
                                type="range"
                                min="20"
                                max={getMaxCropWidth(imageSize)}
                                value={cropSelection.width}
                                onChange={(event) => setCropSelection((crop) => clampCrop({ ...crop, width: Number(event.target.value) }, imageSize))}
                            />
                            <button
                                type="button"
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-stone-50"
                                onClick={() => {
                                    const width = Math.min(80, getMaxCropWidth(imageSize));
                                    const height = getCropHeight(width, imageSize);
                                    setCropSelection({
                                        width,
                                        x: (100 - width) / 2,
                                        y: (100 - height) / 2,
                                    });
                                }}
                            >
                                Reset crop to center
                            </button>
                        </div>
                    </div>
                )}
                {/* Edit mode me current featured image preview dikhate hain. */}
                {post && !imagePreview && !currentImageUrl && (
                    <div className="mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex aspect-video items-center justify-center text-sm text-slate-500">
                            Current image unavailable
                        </div>
                    </div>
                )}
                <Select
                    options={["active", "inactive"]}
                    label="Status"
                    className="mb-4"
                    {...register("status", { required: true })}
                />
                <Input
                    label="Tags"
                    placeholder="react, appwrite, cms"
                    className="mb-4"
                    {...register("tags")}
                />
                {formError && (
                    <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                        {formError}
                    </p>
                )}
                <Button
                    type="submit"
                    bgColor={post ? "bg-emerald-600" : "bg-slate-950"}
                    className="flex w-full items-center justify-center gap-2 hover:bg-emerald-700 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                >
                    {isSubmitting && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
                    )}
                    {isSubmitting ? (post ? "Updating..." : "Publishing...") : (post ? "Update" : "Submit")}
                </Button>
                {isSubmitting && (
                    <p className="mt-3 text-center text-sm font-medium text-slate-500">
                        {post ? "Saving your changes..." : "Uploading image and publishing your post..."}
                    </p>
                )}
            </aside>
        </form>
    );
}
