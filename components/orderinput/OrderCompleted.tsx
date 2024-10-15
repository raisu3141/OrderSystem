import { DialogContent, DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { useRouter } from "next/router";

interface OrderConfirmationProps {
  clientName: string | undefined;
  onClose: () => void; // 閉じるための関数を受け取る
}

export default function OrderCompleted({ clientName, onClose }: OrderConfirmationProps) {
  const router = useRouter();
  
  return (
    <DialogContent className="bg-white flex flex-col items-center w-[80vw] max-w-[1200px] h-[80vh] max-h-[80vh]">
      <DialogHeader className="text-5xl font-semibold">注文完了</DialogHeader>

      <div className="w-full h-full flex flex-col items-center text-2xl mt-12">
        <p>整理券番号</p>
        <p className="text-9xl font-semibold mt-5">32</p>
        <p className="mt-8">{clientName}様</p>
        <p className="mt-14">LINE BOTで整理番号を</p>
        <p>入力してください</p>
      </div>
      

      {/* 閉じる */}
      <Button
        className="w-[50%] mt-4"
        //ページ遷移 
        onClick={() => {
          onClose();
        }}
      >
        閉じる
      </Button>
    </DialogContent>
  );
}
