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
import { Check, ChevronsUpDown } from "lucide-react"
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";

const formSchema = z.object({
  observation: z.string().min(2).max(50),
  amount: z.coerce.number({
    required_error: "Insira um valor.",
  }),
  person: z.number({
    required_error: "Selecione uma pessoa.",
  }),
})

interface Person {
    personID: number;
    name: string;
}

export function CreateExpenseForm() {
  const { toast } = useToast();
  const  [ persons, setPersons ] = useState<Person[]>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5196/api/Lookup/persons", { 
          method: 'GET', 
          mode: 'cors',
          headers: {'Access-Control-Allow-Origin': '*'}
        });
        let result: Person[] = await response.json();
        setPersons(result)
      } catch (error){
        console.error(error)
      }
    };

    fetchData();
    
  },[]);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      observation: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    })
  }

//   const persons = [
//     { label: "Patrick", value: 7 },
//     { label: "Vanessa", value: 8 },
//   ] as const

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
                name="person"
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
                              "w-[200px] justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value && persons
                              ? persons.find(
                                  (person) => person.personID === field.value
                                )?.name
                              : "Select person"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0">
                        <Command>
                          <CommandInput placeholder="Search person..." />
                          <CommandEmpty>No person found.</CommandEmpty>
                          <CommandGroup>
                            {persons && persons.map((person) => (
                              <CommandItem
                                value={person.name}
                                key={person.personID}
                                onSelect={() => {
                                  form.setValue("person", person.personID)
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
                      This is the person that will be used in the dashboard.
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
                name="observation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Input placeholder="Observação da despesa" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your public display name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Submit</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster/>
    </div>
  );
}
