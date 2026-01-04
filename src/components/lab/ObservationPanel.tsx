import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Save, Download, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';

interface Column {
  key: string;
  label: string;
  type: 'number' | 'text';
  readonly?: boolean;
  placeholder?: string;
  calculate?: (row: any) => string;
}

interface TableConfig {
  title: string;
  columns: Column[];
  filename: string;
}

const CONFIGS: Record<string, TableConfig> = {
  'ohms-law': {
    title: 'Ohm\'s Law Observation Table',
    filename: 'ohms_law_results.csv',
    columns: [
      { key: 'voltage', label: 'Voltage (V)', type: 'number', placeholder: '0.0' },
      { key: 'current', label: 'Current (A)', type: 'number', placeholder: '0.00' },
      {
        key: 'resistance',
        label: 'Resistance (Ω)',
        type: 'text',
        readonly: true,
        placeholder: 'Auto',
        calculate: (row) => {
          const v = parseFloat(row.voltage);
          const i = parseFloat(row.current);
          return v && i ? (v / i).toFixed(2) : '';
        }
      },
    ]
  },
  'acid-base-titration': {
    title: 'Titration Observation Table',
    filename: 'titration_results.csv',
    columns: [
      { key: 'initial', label: 'Initial Burette Reading (mL)', type: 'number', placeholder: '0.0' },
      { key: 'final', label: 'Final Burette Reading (mL)', type: 'number', placeholder: '0.0' },
      {
        key: 'volume',
        label: 'Volume of Base Used (mL)',
        type: 'text',
        readonly: true,
        placeholder: 'Auto',
        calculate: (row) => {
          const init = parseFloat(row.initial);
          const fin = parseFloat(row.final);
          return (!isNaN(init) && !isNaN(fin) && fin >= init) ? (fin - init).toFixed(1) : '';
        }
      },
    ]
  },
  'projectile-motion': {
    title: 'Projectile Motion Data',
    filename: 'projectile_motion_results.csv',
    columns: [
      { key: 'angle', label: 'Launch Angle (°)', type: 'number', placeholder: '45' },
      { key: 'velocity', label: 'Initial Velocity (m/s)', type: 'number', placeholder: '15' },
      { key: 'range', label: 'Horizontal Range (m)', type: 'number', placeholder: '0.0' },
      { key: 'height', label: 'Max Height (m)', type: 'number', placeholder: '0.0' },
    ]
  },
  'pendulum': {
    title: 'Simple Pendulum Observations',
    filename: 'pendulum_results.csv',
    columns: [
      { key: 'length', label: 'Length L (cm)', type: 'number', placeholder: '50' },
      { key: 'time20', label: 'Time for 20 osc (s)', type: 'number', placeholder: '28.5' },
      {
        key: 'period',
        label: 'Period T (s)',
        type: 'text',
        readonly: true,
        calculate: (row) => {
          const t = parseFloat(row.time20);
          return t ? (t / 20).toFixed(3) : '';
        }
      },
      {
        key: 'tsquared',
        label: 'T² (s²)',
        type: 'text',
        readonly: true,
        calculate: (row) => {
          const t = parseFloat(row.time20);
          return t ? Math.pow(t / 20, 2).toFixed(3) : '';
        }
      },
    ]
  },
  'microscope-observation': {
    title: 'Microscope Observation Log',
    filename: 'microscope_results.csv',
    columns: [
      { key: 'sample', label: 'Specimen/Sample', type: 'text', placeholder: 'Onion Peel' },
      { key: 'magnification', label: 'Magnification', type: 'text', placeholder: '100x' },
      { key: 'observations', label: 'Visible Structures/Notes', type: 'text', placeholder: 'Cell Wall, Nucleus...' },
    ]
  }
};

interface ObservationPanelProps {
  experimentId?: string;
}

export function ObservationPanel({ experimentId = 'ohms-law' }: ObservationPanelProps) {
  const config = CONFIGS[experimentId] || CONFIGS['ohms-law'];

  const createEmptyRow = () => {
    const row: any = { id: Date.now() + Math.random() };
    config.columns.forEach(col => {
      row[col.key] = '';
    });
    return row;
  };

  const [observations, setObservations] = useState<any[]>([]);

  useEffect(() => {
    setObservations([createEmptyRow()]);

    // Listen for automatic data capture from experiments
    const handleCapture = (event: CustomEvent) => {
      const { data } = event.detail;
      if (data) {
        setObservations(prev => {
          // If first row is empty, use it, otherwise add new
          const firstRow = prev[0];
          const isFirstEmpty = config.columns.every(col => !col.readonly && !firstRow[col.key]);

          const newRow = {
            id: Date.now() + Math.random(),
            ...data
          };

          // Re-calculate fields for the captured data
          config.columns.forEach(col => {
            if (col.calculate) {
              newRow[col.key] = col.calculate(newRow);
            }
          });

          if (isFirstEmpty) return [newRow, ...prev.slice(1)];
          return [...prev, newRow];
        });
        toast.info("Data captured to observation table", {
          icon: <ClipboardList className="w-4 h-4 text-blue-400" />
        });
      }
    };

    window.addEventListener('experiment-data-capture' as any, handleCapture);
    return () => window.removeEventListener('experiment-data-capture' as any, handleCapture);
  }, [experimentId, config]);

  const addRow = () => {
    setObservations([...observations, createEmptyRow()]);
  };

  const removeRow = (id: number) => {
    if (observations.length > 1) {
      setObservations(observations.filter(o => o.id !== id));
    }
  };

  const updateObservation = (id: number, field: string, value: string) => {
    setObservations(observations.map(o => {
      if (o.id === id) {
        const updated = { ...o, [field]: value };
        // Recalculate any calculated fields
        config.columns.forEach(col => {
          if (col.calculate) {
            updated[col.key] = col.calculate(updated);
          }
        });
        return updated;
      }
      return o;
    }));
  };

  const handleSave = () => {
    const filledCount = observations.filter(o => {
      return config.columns.some(col => !col.readonly && o[col.key]);
    }).length;

    if (filledCount === 0) {
      toast.error('Please add at least one observation');
      return;
    }
    toast.success(`Saved ${filledCount} observations to your Digital Lab Notebook`);
  };

  const handleExport = () => {
    const headers = ['S.No', ...config.columns.map(c => c.label)].join(',');
    const rows = observations.map((o, i) => {
      const values = config.columns.map(c => o[c.key] || '');
      return `${i + 1},${values.join(',')}`;
    }).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = config.filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Observations exported as CSV');
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-blue-500/5">
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl border border-blue-500/20">
            <ClipboardList className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight leading-none mb-1">{config.title}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Experimental Data Recording</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} className="h-10 px-4 gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-slate-300 transition-all">
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">Export CSV</span>
          </Button>
          <Button size="sm" onClick={handleSave} className="h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/10 transition-all hover:-translate-y-0.5">
            <Save className="h-4 w-4" />
            <span>Save Note</span>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02]">
              <th className="text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 p-5 w-20">S.No</th>
              {config.columns.map(col => (
                <th key={col.key} className="text-left text-[10px] font-black uppercase tracking-[0.1em] text-slate-500 p-5">
                  {col.label}
                </th>
              ))}
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {observations.map((obs, index) => (
              <tr key={obs.id} className="group hover:bg-white/[0.03] transition-colors relative">
                <td className="p-5 text-sm font-mono text-slate-600 group-hover:text-blue-400/70 transition-colors">{index + 1}</td>
                {config.columns.map(col => (
                  <td key={col.key} className="p-2">
                    <Input
                      type={col.type}
                      placeholder={col.placeholder || "Enter value..."}
                      value={obs[col.key]}
                      readOnly={col.readonly}
                      onChange={(e) => updateObservation(obs.id, col.key, e.target.value)}
                      className={`h-11 bg-slate-950/40 border-white/5 focus:border-blue-500/30 focus:ring-1 focus:ring-blue-500/20 text-slate-200 text-sm transition-all ${col.readonly ? 'opacity-50 cursor-not-allowed border-transparent bg-transparent pointer-events-none' : ''}`}
                    />
                  </td>
                ))}
                <td className="p-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeRow(obs.id)}
                    disabled={observations.length === 1}
                    className="h-10 w-10 text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 disabled:invisible"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-5">
        <Button
          variant="ghost"
          onClick={addRow}
          className="w-full gap-2 border border-dashed border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 text-slate-500 hover:text-blue-400/80 py-8 transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          <span className="font-bold tracking-tight">Add New Observation Block</span>
        </Button>
      </div>
    </div>
  );
}
