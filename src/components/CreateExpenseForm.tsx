"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react"
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import api from '@/services/api';
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

const formSchema = z.object({
  observation: z.string().min(2).max(50),
  amount: z.coerce.number({
    required_error: "Insira um valor.",
  }),
  personID: z.number({
    required_error: "Selecione uma pessoa.",
  }),
  expenseTypeID: z.number({
    required_error: "Selecione um tipo de despesa.",
  }),
  rubricItemID: z.number({
    required_error: "Selecione uma rubrica específica.",
  }),
  carrierID: z.number({
    required_error: "Selecione um portador.",
  }),
  paymentMethodID: z.number({
    required_error: "Selecione uma forma de pagamento.",
  }),
  date: z.date({
    required_error: "Selecione uma data.",
  }),
  status: z.string({
    required_error: "Selecione um status.",
  }),
  installments: z.coerce.number({
    required_error: "Selecione um status.",
  })
})

interface Person {
  personID: number;
  name: string;
}

interface ExpenseType {
  expenseTypeID: number;
  name: string;
}

interface RubricItem {
  rubricItemID: number;
  name: string;
  expenseTypeId: number;
}

interface Carrier {
  carrierID: number;
  description: string;
  carrierTypeID: number;
  personID: number;
}

interface PaymentMethod {
  paymentMethodID: number;
  name: string;
}

const status = [
  {statusID: 1, name: "A pagar"},
  {statusID: 2, name: "Pago"}
]

export function CreateExpenseForm() {
  const { toast } = useToast();
  const  [ persons, setPersons ] = useState<Person[]>();
  const [ expenseTypes, setExpenseTypes ] = useState<ExpenseType[]>();
  const [ rubricItems , setRubricItems ] = useState<RubricItem[]>();
  const [ carriers , setCarriers ] = useState<Carrier[]>();
  const [ paymentMethods , setPaymentMethods ] = useState<PaymentMethod[]>();
  const [ selectedExpenseType, setSelectedExpenseType ] = useState<ExpenseType>();
  const [ selectedCarrier, setSelectedCarrier ] = useState<Carrier>();
  const [ openComboBox, setOpenComboBox ] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/Lookup/persons");
        let result: Person[] = await response.data;
        setPersons(result)
      } catch (error: any){
        console.error(error)
        toast({
          title: "Erro ao carregar Pessoas",
          description: (
            <pre className="mt-2 h-full w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white whitespace-normal">{error.toString()}</code>
            </pre>
          ),
        })
      }
    };

    fetchData();
    
  },[]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/Lookup/expense-types");
        let result: ExpenseType[] = await response.data;
        setExpenseTypes(result)
      } catch (error: any){
        console.error(error)
        toast({
          title: "Erro ao carregar Tipos de Despesa",
          description: (
            <pre className="mt-2 h-full w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white whitespace-normal">{error.toString()}</code>
            </pre>
          ),
        })
      }
    };

    fetchData();
    
  },[]);

  function handleSelectExpenseType(expenseType: ExpenseType){
    if(!expenseType) return
    setSelectedExpenseType(expenseType);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(!selectedExpenseType) return;
        const response = await api.get(`/Lookup/rubric-items/${selectedExpenseType.expenseTypeID}`);
        let result: RubricItem[] = await response.data;
        setRubricItems(result)
      } catch (error: any){
        console.error(error)
        toast({
          title: "Erro ao carregar Rubricas",
          description: (
            <pre className="mt-2 h-full w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white whitespace-normal">{error.toString()}</code>
            </pre>
          ),
        })
      }
    };

    fetchData();
    
  },[selectedExpenseType]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/Lookup/carriers");
        let result: Carrier[] = await response.data;
        setCarriers(result)
      } catch (error: any){
        console.error(error)
        toast({
          title: "Erro ao carregar Portadores",
          description: (
            <pre className="mt-2 h-full w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white whitespace-normal">{error.toString()}</code>
            </pre>
          ),
        })
      }
    };

    fetchData();
    
  },[]);

  function handleSelectCarrier(carrier: Carrier){
    if(!carrier) return
    setSelectedCarrier(carrier);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(!selectedCarrier) return;
        const response = await api.get(`/Lookup/payment-methods/${selectedCarrier.carrierID}`);
        let result: PaymentMethod[] = await response.data;
        setPaymentMethods(result)
      } catch (error: any){
        console.error(error)
        toast({
          title: "Erro ao carregar Formas de Pagamento",
          description: (
            <pre className="mt-2 h-full w-[340px] rounded-md bg-slate-950 p-4">
              <code className="text-white whitespace-normal">{error.toString()}</code>
            </pre>
          ),
        })
      }
    };

    fetchData();
    
  },[selectedCarrier]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observation: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    
    try{
      console.log(JSON.stringify(data))
      await api.post("/Expense", JSON.stringify(data))
      toast({
        title: "Despesa incluída com sucesso"
      })
    } catch(error: any){
      console.error(error)
      toast({
        title: "Erro ao incluir despesa",
        description: (
          <pre className="mt-2 h-full w-[340px] rounded-md bg-slate-950 p-4">
            <code className="text-white whitespace-normal">{error.toString()}</code>
          </pre>
        ),
      })
    }
    
  }

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle>Incluir Despesa</CardTitle>
          <CardDescription>Inclua despesas neste formulário</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Data da Despesa</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            aria-expanded={openComboBox}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Escolha uma data</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-slate-50 rounded" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          // disabled={(date) =>
                          //   date > new Date() || date < new Date("1900-01-01")
                          // }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Insira a data em que a despesa ocorreu ou ocorrerá.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="personID"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Pessoa</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[250px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && persons
                              ? persons.find(
                                  (person) => person.personID === field.value
                                )?.name
                              : "Selecione a pessoa"}
                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[250px] p-0">
                        <Command>
                          <CommandInput placeholder="Procurar pessoa..." />
                          <CommandEmpty>Nenhuma pessoa encontrada.</CommandEmpty>
                          <CommandGroup>
                            {persons && persons.map((person) => (
                              <CommandItem
                                value={person.name}
                                key={person.personID}
                                onSelect={() => {
                                  form.setValue("personID", person.personID)
                                  setOpenComboBox(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    person.personID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {person.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Escolha a pessoa que deu origem a despesa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expenseTypeID"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Tipo de Despesa</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[250px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && expenseTypes
                              ? expenseTypes.find(
                                  (expenseType) => expenseType.expenseTypeID === field.value
                                )?.name
                              : "Selecione o tipo de despesa"}
                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[250px] p-0">
                        <Command>
                          <CommandInput placeholder="Procurar tipo de despesa..." />
                          <CommandEmpty>Tipo de Despesa não encontrada.</CommandEmpty>
                          <CommandGroup>
                            {expenseTypes && expenseTypes.map((expenseType) => (
                              <CommandItem
                                value={expenseType.name}
                                key={expenseType.expenseTypeID}
                                onSelect={() => {
                                  form.setValue("expenseTypeID", expenseType.expenseTypeID)
                                  handleSelectExpenseType(expenseType)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    expenseType.expenseTypeID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {expenseType.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Escolha o tipo de despesa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rubricItemID"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Rubrica Específica</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[250px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && rubricItems
                              ? rubricItems.find(
                                  (rubricItem) => rubricItem.rubricItemID === field.value
                                )?.name
                              : "Selecione a Rubrica"}
                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[250px] p-0">
                        <Command>
                          <CommandInput placeholder="Procurar rubrica..." />
                          <CommandEmpty>Rubrica não encontrada.</CommandEmpty>
                          <CommandGroup>
                            {rubricItems && rubricItems.map((rubricItem) => (
                              <CommandItem
                                value={rubricItem.name}
                                key={rubricItem.rubricItemID}
                                onSelect={() => {
                                  form.setValue("rubricItemID", rubricItem.rubricItemID)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    rubricItem.rubricItemID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {rubricItem.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Escolha a rubrica específica relativa ao tipo de despesa selecionado.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="carrierID"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Portador</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[250px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && carriers
                              ? carriers.find(
                                  (carrier) => carrier.carrierID === field.value
                                )?.description
                              : "Selecione o portador"}
                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[250px] p-0">
                        <Command>
                          <CommandInput placeholder="Procurar portador..." />
                          <CommandEmpty>Portador não encontrado.</CommandEmpty>
                          <CommandGroup>
                            {carriers && carriers.map((carrier) => (
                              <CommandItem
                                value={carrier.description}
                                key={carrier.carrierID}
                                onSelect={() => {
                                  form.setValue("carrierID", carrier.carrierID)
                                  handleSelectCarrier(carrier)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    carrier.carrierID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {carrier.description}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Selecione o portador utilizado na despesa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentMethodID"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Forma de pagamento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[250px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && paymentMethods
                              ? paymentMethods.find(
                                  (paymentMethod) => paymentMethod.paymentMethodID === field.value
                                )?.name
                              : "Selecione forma de pagamento"}
                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0">
                        <Command>
                          <CommandInput placeholder="Procurar forma de pagamento..." />
                          <CommandEmpty>Forma de pagamento não encontrada.</CommandEmpty>
                          <CommandGroup>
                            {paymentMethods && paymentMethods.map((paymentMethod) => (
                              <CommandItem
                                value={paymentMethod.name}
                                key={paymentMethod.paymentMethodID}
                                onSelect={() => {
                                  form.setValue("paymentMethodID", paymentMethod.paymentMethodID)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    paymentMethod.paymentMethodID === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {paymentMethod.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Selecione a forma de pagamento utilizada nesta despesa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Status da despesa</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && status
                              ? status.find(
                                  (status) => status.name === field.value
                                )?.name
                              : "Selecione o status"}
                            {/* <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /> */}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Procurar status..." />
                          <CommandEmpty>Status não encontrado.</CommandEmpty>
                          <CommandGroup>
                            {status && status.map((status) => (
                              <CommandItem
                                value={status.name}
                                key={status.statusID}
                                onSelect={() => {
                                  form.setValue("status", status.name)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    status.name === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {status.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      Indique se a despesa está paga ou não.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Valor</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="100.00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Valor da despesa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parcelas</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Insira a quantidade de parcelas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Input placeholder="Observação da despesa" {...field} />
                    </FormControl>
                    <FormDescription>
                      Detalhe a despesa incluída.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Criar Despesa</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster/>
    </div>
  );
}
