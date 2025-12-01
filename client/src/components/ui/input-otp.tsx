import * as React from 'react'
import { OTPInput, OTPInputContext } from 'input-otp'
import { Dot } from 'lucide-react'

import { cn } from '@/lib/utils'

const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
))
InputOTP.displayName = 'InputOTP'

const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
))
InputOTPGroup.displayName = 'InputOTPGroup'

const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index]

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-10 w-10 text-center text-sm',
        'border-y border-r border-input first:rounded-l-md first:border-l last:rounded-r-md',
        'focus-within:z-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-background',
        isActive && 'z-10 ring-2 ring-ring ring-offset-background',
        className
      )}
      {...props}
    >
      <input
        className={cn(
          'absolute inset-0 h-full w-full text-center text-sm',
          'bg-transparent caret-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50'
        )}
        //@ts-ignore
        value={char}
        onChange={e => {
          const value = e.target.value
          if (value.length <= 1) {
            //@ts-ignore
            inputOTPContext.setValue(index, value)
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Backspace') {
            //@ts-ignore
            inputOTPContext.setValue(index, '')
            if (index > 0) {
              //@ts-ignore
              inputOTPContext.focus(index - 1)
            }
          } else if (e.key === 'ArrowLeft') {
            if (index > 0) {
              //@ts-ignore
              inputOTPContext.focus(index - 1)
            }
          } else if (e.key === 'ArrowRight') {
            if (index < inputOTPContext.slots.length - 1) {
              //@ts-ignore
              inputOTPContext.focus(index + 1)
            }
          }
        }}
      />
      {hasFakeCaret && (
        <div className='pointer-events-none absolute inset-0 flex items-center justify-center animate-caret-blink'>
          <div className='h-4 w-px bg-foreground duration-150' />
        </div>
      )}
    </div>
  )
})
InputOTPSlot.displayName = 'InputOTPSlot'

const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role='separator' {...props}>
    <Dot />
  </div>
))
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
