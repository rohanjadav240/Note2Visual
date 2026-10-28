import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Sparkles,
  BookOpen,
  ArrowRight,
  Code,
  Dna,
  Atom,
  TrendingUp,
  History,
  Calculator
} from 'lucide-react';
import { apiService } from '../services/api';
import type { VisualPattern } from '../types';

interface TemplateItem {
  id: string;
  title: string;
  subject: string;
  pattern: VisualPattern;
  icon: any;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  content: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'cs-distributed',
    title: 'Distributed Systems & Raft Consensus',
    subject: 'Computer Science',
    pattern: 'system_architecture',
    icon: Code,
    level: 'intermediate',
    description: 'Leader election, log replication, safety invariants, and fault tolerance under network partitions.',
    content: `Distributed Systems and Consensus:
A distributed system consists of autonomous computing nodes communicating over a network to coordinate actions.
CAP Theorem establishes that a distributed data store can guarantee at most two of: Consistency, Availability, and Partition Tolerance.
Raft Consensus Algorithm achieves consensus via Leader Election, Log Replication, and Safety invariants.
Byzantine Fault Tolerance handles nodes that may fail arbitrarily, fail to respond, or send conflicting information.
State Machine Replication guarantees all nodes execute identical state transitions given an ordered transaction log.`
  },
  {
    id: 'bio-respiration',
    title: 'Cellular Respiration & Bioenergetics',
    subject: 'Biology',
    pattern: 'flowchart',
    icon: Dna,
    level: 'intermediate',
    description: 'Glycolysis, Krebs cycle, electron transport chain, and chemiosmotic ATP synthesis.',
    content: `Cellular Respiration and ATP Production:
Glycolysis occurs in the cytoplasm, breaking 1 glucose molecule into 2 pyruvate molecules and yielding 2 ATP net and 2 NADH.
The Krebs Cycle (Citric Acid Cycle) takes place in the mitochondrial matrix. Acetyl-CoA combines with oxaloacetate to form citrate. It produces CO2, ATP, NADH, and FADH2.
Oxidative Phosphorylation is located on the inner mitochondrial cristae membrane. High energy electrons pass through complexes I-IV, creating a proton gradient that drives ATP Synthase to generate approximately 30-32 ATP per glucose molecule.`
  },
  {
    id: 'econ-monetary',
    title: 'Central Banking & Macroeconomic Policy',
    subject: 'Economics',
    pattern: 'mind_map',
    icon: TrendingUp,
    level: 'intermediate',
    description: 'Federal funds rate, reserve ratios, open market operations, quantitative easing, and inflation mechanics.',
    content: `Monetary Policy and Inflation Control:
Central banks manage liquidity and interest rates to achieve price stability and maximum sustainable employment.
The Federal Funds Rate influences borrowing costs throughout the commercial banking system.
Open Market Operations involve buying or selling government securities to regulate bank reserve balances.
Quantitative Easing expands the central bank balance sheet by purchasing long-term financial assets when policy rates are near the zero lower bound.`
  },
  {
    id: 'phys-relativity',
    title: 'Special Relativity & Spacetime Mechanics',
    subject: 'Physics',
    pattern: 'concept_network',
    icon: Atom,
    level: 'advanced',
    description: 'Invariance of the speed of light, Lorentz transformations, time dilation, and length contraction.',
    content: `Special Theory of Relativity:
The principle of relativity asserts that the laws of physics are invariant across all inertial reference frames.
The constancy of the speed of light in vacuum is identical for all observers regardless of relative motion.
Lorentz Transformations describe how spacetime coordinates transform between moving frames.
Time Dilation dictates that a moving clock ticks slower relative to an observer at rest: t' = gamma * t.
Mass-Energy Equivalence establishes that energy and mass are interchangeable via E = mc^2.`
  },
  {
    id: 'hist-scientific',
    title: 'The Scientific Revolution (1543-1687)',
    subject: 'History',
    pattern: 'timeline',
    icon: History,
    level: 'beginner',
    description: 'From Copernicus heliocentrism to Galileo telescopes and Newton Principia Mathematica.',
    content: `The Scientific Revolution:
In 1543, Nicolaus Copernicus published De revolutionibus orbium coelestium, proposing a heliocentric model of the universe.
Johannes Kepler formulated the three laws of planetary motion, establishing elliptical planetary orbits.
Galileo Galilei utilized the telescope to discover Jupiter moons and phases of Venus, providing observational proof against geocentrism.
Isaac Newton published the Principia in 1687, unifying celestial and terrestrial mechanics with the Universal Law of Gravitation.`
  },
  {
    id: 'math-calculus',
    title: 'Fundamental Theorem of Calculus',
    subject: 'Mathematics',
    pattern: 'math_explanation',
    icon: Calculator,
    level: 'intermediate',
    description: 'Linking differentiation and integration through accumulated area functions and antiderivatives.',
    content: `Fundamental Theorem of Calculus:
Part 1 states that if f is continuous on [a,b], then the function g(x) = integral from a to x of f(t)dt is continuous and differentiable, with g'(x) = f(x).
Part 2 demonstrates evaluation: the definite integral from a to b of f(x)dx equals F(b) - F(a), where F is any antiderivative of f.
Riemann Sums approximate the area beneath a curve using finite rectangular partitions as partition norm approaches zero.
Integration and Differentiation are inverse mathematical operations.`
  }
];

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUseTemplate = async (template: TemplateItem) => {
    try {
      setLoadingId(template.id);

      const project = await apiService.createProject({
        title: template.title,
        subject: template.subject,
        language: 'en',
        explanation_level: template.level,
        detail_amount: 'standard',
        default_pattern: template.pattern,
      });

      const blob = new Blob([template.content], { type: 'text/plain' });
      const file = new File([blob], `${template.id}.txt`, { type: 'text/plain' });

      await apiService.uploadDocument(project.id, file);
      await apiService.generateLesson(project.id);

      navigate(`/processing/${project.id}`);
    } catch (err) {
      console.error('Failed to instantiate template:', err);
      alert('Could not launch template. Ensure backend is running.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      <div>
        <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-slate-100">
          Curated Syllabus Templates
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Instant 1-click academic lessons to explore different visual paradigms without uploading your own notes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isLoading = loadingId === tmpl.id;

          return (
            <div
              key={tmpl.id}
              className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:border-slate-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tmpl.subject}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                  {tmpl.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {tmpl.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400 capitalize">
                  Pattern: {tmpl.pattern.replace('_', ' ')}
                </span>

                <button
                  onClick={() => handleUseTemplate(tmpl)}
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <span>{isLoading ? 'Generating...' : 'Launch Lesson'}</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
