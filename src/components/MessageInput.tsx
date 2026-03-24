import { useRef, useState } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";
import { ImageIcon, SendIcon, XIcon } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";

const messageSchema = z.object({
  text: z.string().optional(),
  image: z.custom<FileList>().optional()
}).refine((data) => {
  const hasText = data.text?.trim();
  const hasImage = data.image && data.image.length > 0;
  return hasText || hasImage;
}, {
  message: "Message or image is required",
  path: ["text"],
});

export type TMessageSchema = z.infer<typeof messageSchema>;

const MessageInput = () => {
  const { palyRandomKeyStrokeSound } = useKeyboardSound();
  const { isSoundEnabled, sendMessage } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch } = useForm<TMessageSchema>({
    mode: 'onTouched',
    resolver: zodResolver(messageSchema)
  })

  const textValue = watch('text');

  const submitForm: SubmitHandler<TMessageSchema> = (data) => {
    const file = data.image?.[0];
    if (isSoundEnabled) palyRandomKeyStrokeSound();

    const formData = new FormData();
    formData.append("text", data.text?.trim() || "");
    
    if (file) {
      formData.append("image", file);
    }

    sendMessage(formData);
    reset();
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image");
      return;
    }

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);

    setValue('image', e.target.files as FileList, {
      shouldValidate: true,
    });
  }; 

  const removeImage = () => {
    setImagePreview(null);
    setValue('image', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  return (
    <div className="p-4 border-t border-slate-700/50">

      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={(e) => handleSubmit(submitForm)(e)} className="max-w-3xl mx-auto flex space-x-4">

        <input 
          type="text" 
          {...register('text')}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-4 transition-colors ${
            imagePreview ? "text-cyan-500" : ""
          }`}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <button
          type="submit"
          disabled={!textValue?.trim() && !imagePreview}
          className="bg-linear-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-5 h-5" />
        </button>

      </form>

    </div>
  )
}

export default MessageInput;
