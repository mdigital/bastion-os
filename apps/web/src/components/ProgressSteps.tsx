import { CheckCircle2 } from 'lucide-react'

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'keyInfo', label: 'Key Info' },
  { id: 'triage', label: 'Triage' },
  { id: 'sections', label: 'Enhancement' },
] as const

type Step = (typeof STEPS)[number]['id']

type Props = {
  currentStep: Step
  setCurrentStep: (step: Step) => void
}

// Get className for step circle based on completion status
const getCircleClassName = (isCompleted: boolean, isActive: boolean): string => {
  if (isCompleted) return 'bg-yellow-400 border-yellow-400 hover:bg-yellow-500'
  if (isActive) return 'bg-black border-black text-white'
  return 'bg-white border-gray-300 text-gray-400'
}

// Get className for step label based on availability
const getLabelClassName = (isClickable: boolean): string => {
  return isClickable ? 'text-black' : 'text-gray-400'
}

// Get className for connecting line based on completion
const getLineClassName = (isCompleted: boolean): string => {
  return isCompleted ? 'bg-yellow-400' : 'bg-gray-200'
}

interface StepItemProps {
  step: (typeof STEPS)[number]
  index: number
  isCompleted: boolean
  isActive: boolean
  isClickable: boolean
  isLastStep: boolean
  onStepClick: () => void
}

function StepItem({
  step,
  index,
  isCompleted,
  isActive,
  isClickable,
  isLastStep,
  onStepClick,
}: StepItemProps) {
  return (
    <div key={step.id} className="flex items-center flex-1">
      <button
        type="button"
        className={`flex items-center gap-3 ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        onClick={onStepClick}
        disabled={!isClickable}
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${getCircleClassName(isCompleted, isActive)}`}
        >
          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <span>{index + 1}</span>}
        </div>
        <span className={getLabelClassName(isClickable)}>{step.label}</span>
      </button>

      {!isLastStep && <div className={`flex-1 h-0.5 mx-4 ${getLineClassName(isCompleted)}`} />}
    </div>
  )
}

export default function ProgressSteps({ currentStep, setCurrentStep }: Props) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  const handleStepClick = (stepId: Step, index: number) => {
    // Only allow clicking on current step or previous steps
    if (index <= currentStepIndex) {
      setCurrentStep(stepId)
    }
  }

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-screen-2xl mx-auto px-8 py-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              isCompleted={index < currentStepIndex}
              isActive={index === currentStepIndex}
              isClickable={index <= currentStepIndex}
              isLastStep={index === STEPS.length - 1}
              onStepClick={() => handleStepClick(step.id, index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
