// ============================================================================
// SALES HISTORY - Component
// Tabela de vendas recentes com estilo cyberpunk
// ============================================================================

'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Sale {
  id: string;
  price_brl: number;
  sold_at: string;
  seller: {
    id: string;
    name: string;
    username: string;
  };
  buyer?: {
    id: string;
    name: string;
  };
}

interface SalesHistoryProps {
  sales: Sale[];
  maxHeight?: number;
  showBuyer?: boolean;
}

export function SalesHistory({ sales, maxHeight = 400, showBuyer = false }: SalesHistoryProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className="bg-gray-900/30 rounded-lg border border-gray-800 p-8 text-center">
        <p className="text-gray-500">Nenhuma venda registrada ainda</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
      <div 
        className="overflow-y-auto custom-scrollbar"
        style={{ maxHeight }}
      >
        <table className="w-full">
          <thead className="sticky top-0 bg-black/90 backdrop-blur-sm">
            <tr className="border-b border-gray-800">
              <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide">
                Preço
              </th>
              <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide">
                Vendedor
              </th>
              {showBuyer && (
                <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide">
                  Comprador
                </th>
              )}
              <th className="text-left py-3 px-4 text-xs text-gray-400 uppercase tracking-wide">
                Quando
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr 
                key={sale.id}
                className={`
                  border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors
                  ${index === 0 ? 'bg-[#00F0FF]/5' : ''}
                `}
              >
                {/* Preço */}
                <td className="py-3 px-4">
                  <span className="text-[#00F0FF] font-bold text-lg">
                    R$ {sale.price_brl.toFixed(2)}
                  </span>
                </td>

                {/* Vendedor */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#FF006D] flex items-center justify-center text-xs font-bold">
                      {sale.seller.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="text-white text-sm">{sale.seller.name || 'Anonymous'}</p>
                      <p className="text-gray-500 text-xs">@{sale.seller.username}</p>
                    </div>
                  </div>
                </td>

                {/* Comprador (opcional) */}
                {showBuyer && (
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF006D] to-[#FFD600] flex items-center justify-center text-xs font-bold">
                        {sale.buyer?.name?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <p className="text-white text-sm">{sale.buyer?.name || 'Privado'}</p>
                    </div>
                  </td>
                )}

                {/* Timestamp */}
                <td className="py-3 px-4">
                  <span className="text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(sale.sold_at), { 
                      addSuffix: true,
                      locale: ptBR 
                    })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer com total */}
      <div className="border-t border-gray-800 bg-black/50 p-3">
        <p className="text-xs text-gray-500 text-center">
          Mostrando {sales.length} {sales.length === 1 ? 'venda' : 'vendas'}
        </p>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
