// var.c
// define var
// poet modified to use F_SHELL
// poet modified to use free command style
#include <shell.h>

int main(object me, string arg)
{
   mixed result;
   string name, value;
   int index;

   if (!arg)
   {
       mapping vars;
       string content;

      if (!SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

       vars = me->query_all_vars();

       content = "您当前设置的私有变量有：\n";

       content += sprintf("me\t: %s\t== %O\n", typeof(me), me);
       content += sprintf("here\t: %s\t== %O\n",
           typeof(environment(me)), environment(me));
       foreach(name in keys(vars))
       {

           if (undefinedp(vars[name]) || nullp(vars[name]))
               content += sprintf("%s\t: void\n", name);
           else
               content += sprintf("%s\t: %s\t== %O\n", name,
                 typeof(vars[name]), vars[name]);
       }

       tell_object(me, content);
       return 1;
   }

   index = strsrch(arg, '=');

   if ( index == -1 )
   {
       name = arg;
   } else
   {
       name = arg[0..(index-1)];
       value = arg[(index+1)..<1];
   }

   name = replace_string(name, " ", "");

   if ( name == "me" || name == "here" )
   {
       return notify_fail("这是系统预定义的私有变量。\n");
   }

   if ( !value )
   {
       if (undefinedp(result) || nullp(result))
           printf("%s\t: void\n", name);
       else
           printf("%s\t: %s\t== %O\n", name,
               typeof(me->query_var(name)), me->query_var(name));
       return 1;
   }

   if ( value == "none" || value == " none"
     || value == "null" || value == " null" )
   {
       me->delete_var(name);
       printf("Delete var '%s' Ok.\n", name);


       return 1;
   }

   if (me->query_var_count() >= MAX_VAR_COUNT)
       return notify_fail("请不要设置过多的私有变量。\n");

   result = me->evaluate_shell(value, 0);

   result = me->set_var(name, result);

   if (undefinedp(result) || nullp(result))
       printf("%s\t: void\n", name);
   else
       printf("%s\t: %s\t== %O\n", name, typeof(result), result);

   return 1;
}

int help(object me)
{
   write(@HELP
指令格式 : var name=value


这个指令可以设置私有变量，其中 value 的语法和 LPC 程序完全相同。
变量可以在 dual 或者内嵌 shell 中使用，或者 export 到环境变量中去。

单独使用 var 命令列出目前的私有变量列表。

系统已预定义变量 me 和 here

HELP
   );
   return 1;
}

