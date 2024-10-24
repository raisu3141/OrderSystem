
import CompletedOrders from "../../components/showcompleted/completedorders"

export default function ShowCompletedOrder() {
    return (
        <div>
            <div className="sticky top-0 bg-white border-b-2 border-gray-300 p-4 z-10 flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold">お呼び出し中の注文番号</h1>
            </div>
        <CompletedOrders />
        </div>
    )
}