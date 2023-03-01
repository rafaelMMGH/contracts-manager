import React, {useRef} from 'react';
import AddressComponent from "./components/addressComponent";
import ContractTypeComponent from "./components/contractTypeComponent";
import { ChevronDoubleRightIcon } from '@heroicons/react/20/solid'

function App() {
  const firstSection  = useRef(null);
  const secondSection = useRef(null);

  const scrollTo = (section: any) => section.current.scrollIntoView({behavior: "smooth"});
  const generatePDF = () => 'a';
  return (
    <div className="bg-slate-900 ">
      <div className="flex flex-col rounded-3xl px-6 sm:px-8 order-first py-8 lg:order-none h-screen place-content-center" ref={firstSection}>
        <div className="md:grid md:grid-cols-6 md:gap-6">
          <div className="mt-5 md:col-span-4 md:col-start-2 md:mt-0">
            <form action="#" method="POST">
              <div className="shadow sm:overflow-hidden sm:rounded-md">
                <div className="space-y-6 bg-gray-100 px-4 py-5 sm:p-6">
                  <ContractTypeComponent />
                  <AddressComponent />
                </div>
                <div className="bg-blue-700 px-4 py-3 text-right sm:px-6">
                  <button
                    type="button"
                    onClick={() => scrollTo(secondSection)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-white py-2 px-4 text-sm font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    <ChevronDoubleRightIcon className="mr-2.5 h-5 w-5 text-blue-600" aria-hidden="true"></ChevronDoubleRightIcon>
                    <span>Siguiente</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
