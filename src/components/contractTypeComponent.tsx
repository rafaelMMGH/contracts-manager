import React, {useState} from 'react'
import {RadioGroup} from '@headlessui/react'
import {CheckCircleIcon} from '@heroicons/react/20/solid'
import House_image from '../images/house.jpg';
import Commerce_image from '../images/commerce.jpg';

const mailingLists = [
  {id: 1, title: 'Casa Habitación', imageSrc: House_image, imageAlt: 'Casa Habiación'},
  {id: 2, title: 'Comercio', imageSrc: Commerce_image, imageAlt: 'Comercio'}
]

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export default function ContractTypeComponent() {

  const [selectedMailingLists, setSelectedMailingLists] = useState(mailingLists[0])

  return (
    <RadioGroup value={selectedMailingLists} onChange={setSelectedMailingLists}>
      <RadioGroup.Label className="text-base font-medium text-gray-900">Tipo de contrato</RadioGroup.Label>

      <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4 content-center">
        {mailingLists.map((mailingList) => (
          <RadioGroup.Option
            key={mailingList.id}
            value={mailingList}
            className={({checked, active}) =>
              classNames(
                checked ? 'border-transparent' : 'border-gray-300',
                active ? 'border-indigo-500 ring-2 ring-indigo-500' : '',
                'relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none'
              )
            }
          >
            {({checked, active}) => (
              <>

                <a href="#" className="flex flex-col items-center group gap-2">
                  <RadioGroup.Description as="div" className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
                    <img
                      className="rounded border-2 border-transparent group-hover:border-2 group-hover:border-gray-300"
                      width={250}
                      src={mailingList.imageSrc}
                      alt={mailingList.imageAlt}/>
                  </RadioGroup.Description>
                  <RadioGroup.Label as="span" className="block text-sm font-medium text-gray-900 mb-1">
                    {mailingList.title}
                  </RadioGroup.Label>
                </a>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  )
}


