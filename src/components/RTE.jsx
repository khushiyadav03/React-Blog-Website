import {Editor } from '@tinymce/tinymce-react';
import {Controller } from 'react-hook-form';
import appwriteService from '../appwrite/config';


export default function RTE({name, control, label, defaultValue =""}) {
  return (
    <div className='w-full'> 
    {label && <label className='inline-block mb-1 pl-1'>{label}</label>}

    <Controller
    name={name || "content"}
    control={control}
    render={({field: {onChange}}) => (
        <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        initialValue={defaultValue}
        init={{
            initialValue: defaultValue,
            height: 500,
            menubar: true,
            automatic_uploads: true,
            paste_data_images: true,
            images_upload_handler: async (blobInfo, progress) => {
                progress(20);

                const blob = blobInfo.blob();
                const file = new File([blob], blobInfo.filename(), {
                    type: blob.type,
                });

                const uploadedFile = await appwriteService.uploadFile(file);

                if (!uploadedFile) {
                    throw new Error("Image upload failed");
                }

                progress(100);
                return appwriteService.getFileView(uploadedFile.$id);
            },
            image_title: true,
            image_advtab: true,
            file_picker_types: "image",
            object_resizing: true,
            image_class_list: [
                { title: "Responsive", value: "article-image" },
                { title: "Float left", value: "article-image align-left" },
                { title: "Float right", value: "article-image align-right" },
                { title: "Full width", value: "article-image full-width" },
            ],
            plugins: [
                "image",
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
                "anchor",
                "quickbars",
            ],
            toolbar:
            "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | image media table | removeformat | help",
            quickbars_image_toolbar: "alignleft aligncenter alignright | imageoptions",
            content_style: `
                body { font-family: Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.7; }
                img.article-image { max-width: 100%; height: auto; border-radius: 14px; margin: 16px 0; }
                img.full-width { width: 100%; display: block; }
                img.align-left { float: left; max-width: 46%; margin: 8px 20px 12px 0; }
                img.align-right { float: right; max-width: 46%; margin: 8px 0 12px 20px; }
                p { min-height: 1em; }
            `
        }}
        onEditorChange={onChange}
        />
    )}
    />

     </div>
  )
}
