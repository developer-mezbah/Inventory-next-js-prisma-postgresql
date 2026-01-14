import { useState } from "react";
import CustomModal from "./CustomModal";
import { FaSearch, FaTimes } from "react-icons/fa";


const mockItems = [
    { id: 1, name: 'Tuna Can, 5oz', quantity: 2 },
    { id: 2, name: 'Milk, Whole, 1 Gallon', quantity: 1 },
    { id: 3, name: 'Potatoes (Bag)', quantity: 0 },
    { id: 4, name: 'ASDFSADF', quantity: 0 },
    { id: 5, name: 'Old Spice Deodorant', quantity: 1 },
];


const MoveCategoryModal = ({ isOpen, onClose }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [removeItem, setRemoveItem] = useState(false);

    const toggleItemSelection = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const filteredItems = mockItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        // Pass a name prop to CustomModal to trigger larger size
        <CustomModal isOpen={isOpen} onClose={onClose} name="MoveCategory" width="max-w-3xl">

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Select Items</h2>
                <button
                    onClick={onClose}
                    aria-label="Close modal"
                    className="p-1 text-gray-400 rounded-full hover:bg-gray-50 hover:text-gray-600 transition"
                >
                    <FaTimes className="h-5 w-5" />
                </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 pb-2">
                {/* Search Input */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Search items"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full py-3 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>

                {/* Items Table / List - Responsive Design */}
                <div className="overflow-x-auto max-h-96 border border-gray-200 rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col" className="w-12 px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {/* Select All Checkbox Placeholder */}
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className={`hover:bg-blue-50/50 cursor-pointer ${selectedItems.includes(item.id) ? 'bg-blue-50' : ''}`}
                                    onClick={() => toggleItemSelection(item.id)}
                                >
                                    <td className="w-12 px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.includes(item.id)}
                                            onChange={() => toggleItemSelection(item.id)}
                                            className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-semibold">
                                        {item.quantity}
                                    </td>
                                </tr>
                            ))}
                            {filteredItems.length === 0 && (
                                <tr>
                                    <td colSpan="3" className="text-center py-6 text-gray-500">No items found matching "{searchTerm}"</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 pt-4 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border-t border-gray-100 mt-2">
                {/* Checkbox */}
                <div className="flex items-center mb-4 sm:mb-0">
                    <input
                        id="remove-checkbox"
                        type="checkbox"
                        checked={removeItem}
                        onChange={(e) => setRemoveItem(e.target.checked)}
                        className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <label htmlFor="remove-checkbox" className="ml-2 block text-sm text-gray-900">
                        Remove selected items from existing category
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 w-full sm:w-auto">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-6 text-gray-700 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => {
                            console.log('Items to move:', selectedItems);
                            console.log('Remove from source:', removeItem);
                            onClose();
                        }}
                        disabled={selectedItems.length === 0}
                        className={`flex-1 py-3 px-6 whitespace-nowrap text-white font-semibold text-md rounded-lg shadow-lg transition duration-150 ease-in-out ${selectedItems.length > 0
                                ? 'bg-red-600 hover:bg-red-700 transform hover:scale-[1.01]'
                                : 'bg-red-400 cursor-not-allowed'
                            }`}
                    >
                        Move to this category
                    </button>
                </div>
            </div>
        </CustomModal>
    );
};

export default MoveCategoryModal;