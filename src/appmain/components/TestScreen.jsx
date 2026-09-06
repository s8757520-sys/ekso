/**
 * File: TestScreen.jsx
 * Date: 2026-09-04
 * Purpose: Diagnostic screen to check width rendering
 * Description: Shows colored blocks to identify layout issues
 * Author: Ekso Team
 */

const TestScreen = () => {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Красный блок — должен быть на всю ширину */}
        <div className="w-full bg-red-500 text-white text-center py-4 text-xl">
          🔴 Этот блок должен быть на всю ширину экрана
        </div>
  
        {/* Зелёный блок — тоже на всю ширину */}
        <div className="w-full bg-green-500 text-white text-center py-4 text-xl">
          🟢 И этот блок тоже на всю ширину
        </div>
  
        {/* Синий блок — для проверки адаптивности */}
        <div className="w-full bg-blue-500 text-white text-center py-4 text-xl">
          🔵 Если они на всю ширину — проблема в MainApp
        </div>
  
        {/* Информация о ширине */}
        <div className="w-full bg-white p-4 text-center text-gray-800">
          <p className="text-lg font-bold">Информация:</p>
          <p className="text-sm">
            Ширина экрана: <span id="width-display" className="font-mono"></span>
          </p>
          <p className="text-sm mt-2">
            Если блоки красный, зелёный, синий — на всю ширину,<br />
            то проблема в `MainApp.jsx`, а не в CSS.
          </p>
        </div>
  
        {/* Кнопка назад */}
        <div className="w-full flex justify-center p-4">
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
          >
            Обновить страницу
          </button>
        </div>
      </div>
    );
  };
  
  export default TestScreen;