import React, {useRef} from 'react';

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
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <legend className="contents text-base font-medium text-gray-900">Tipo de contrato</legend>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center">
                          <input
                            id="push-everything"
                            name="push-notifications"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="push-everything" className="ml-3 block text-sm font-medium text-gray-700">
                            Casa Habitación
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="push-email"
                            name="push-notifications"
                            type="radio"
                            className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <label htmlFor="push-email" className="ml-3 block text-sm font-medium text-gray-700">
                            Comercio
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Dirección
                    </label>
                    <div className="mt-1">
                      <select
                        id="address"
                        name="address"
                        autoComplete="address-name"
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-black py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
                        <option>United States</option>
                        <option>Canada</option>
                        <option>Mexico</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-700 px-4 py-3 text-right sm:px-6">
                  <button
                    type="button"
                    onClick={() => scrollTo(secondSection)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-white py-2 px-4 text-sm font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    Siguiente
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.7"
                         stroke="currentColor" className="animate-pulse ml-2 -mr-1 w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>


                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden sm:flex relative flex py-5 items-center" aria-hidden="true" ref={secondSection} >
        <div className="flex-grow border-t border-gray-200"></div>
        <button type="button"
                onClick={() => scrollTo(firstSection)}
                className="text-blue-700 border border-blue-700 hover:bg-blue-700 hover:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
               stroke="currentColor" className="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18"/>
          </svg>

          <span className="sr-only">Icon description</span>
        </button>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="flex flex-col rounded-3xl px-6 sm:px-8 order-first py-8 lg:order-none h-screen place-content-center">
        <div className="md:grid md:grid-cols-6 md:gap-6">
          <div className="mt-5 md:col-span-4 md:col-start-2 md:mt-0">
            <form action="#" method="POST">
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="landlord-name" className="block text-sm font-medium text-gray-700">
                        Nombre del arrendador
                      </label>
                      <input
                        type="text"
                        name="landlord-name"
                        id="landlord-name"
                        autoComplete="given-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="lessor-name" className="block text-sm font-medium text-gray-700">
                        Nombre del arrendatario
                      </label>
                      <input
                        type="text"
                        name="lessor-name"
                        id="lessor-name"
                        autoComplete="family-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="first-witness-name" className="block text-sm font-medium text-gray-700">
                        Primer testigo
                      </label>
                      <input
                        type="text"
                        name="first-witness-name"
                        id="first-witness-name"
                        autoComplete="given-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="second-witness-name" className="block text-sm font-medium text-gray-700">
                        Segundo testigo
                      </label>
                      <input
                        type="text"
                        name="second-witness-name"
                        id="second-witness-name"
                        autoComplete="family-name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-6 lg:col-span-6 border-t border-gray-200" />

                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="initial-date" className="block text-sm font-medium text-gray-700">
                        Fecha inicial
                      </label>
                      <input
                        type="date"
                        name="initial-date"
                        id="initial-date"
                        autoComplete="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="final-date" className="block text-sm font-medium text-gray-700">
                        Fecha Final
                      </label>
                      <input
                        type="date"
                        name="final-date"
                        id="final-date"
                        autoComplete="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                        Duración
                      </label>
                      <input
                        type="text"
                        name="duration"
                        id="duration"
                        disabled
                        className="mt-1 block w-full rounded-md border-gray-100 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-6 lg:col-span-2 lg:col-start-3">
                      <label htmlFor="sign-date" className="block text-sm font-medium text-gray-700">
                        Fecha de firma
                      </label>
                      <input
                        type="date"
                        name="sign-date"
                        id="sign-date"
                        autoComplete="address-level2"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-6 lg:col-span-6 border-t border-gray-200" />

                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="rent-amount" className="block text-sm font-medium text-gray-700">
                        Monto renta
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="text"
                          name="rent-amount"
                          id="rent-amount"
                          className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                      <label htmlFor="escrow-amount" className="block text-sm font-medium text-gray-700">
                        Monto deposito
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                          type="text"
                          name="escrow-amount"
                          id="escrow-amount"
                          className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>



                  </div>
                </div>
                <div className="bg-blue-700 px-4 py-3 text-right sm:px-6">
                  <button
                    type="button"
                    onClick={() => generatePDF()}
                    className="inline-flex justify-center rounded-md border border-transparent bg-white py-2 px-4 text-sm font-medium text-blue-600 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                  >
                    Generar contrato
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
