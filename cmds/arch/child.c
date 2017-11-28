// child.c

inherit F_CLEAN_UP;

int main(object me, string str)
{
        object where, *list;
        int i, number;

        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        if (! str) str = me->query("cwf");
        if (! str) return notify_fail("你要查看哪个文件？\n");
  
        str = resolve_path(me->query("cwd"), str);
        if (sscanf(str, "%*s.c") != 1) str += ".c";
                me->set("cwf", str);
      
        if (file_size(str) < 0)
               	return  notify_fail("没有这个文件："  +  str  +  ")\n");

        list = children(str);
        number = sizeof(list);
        if (number)
	{
              	for (i = 0; i < sizeof(list); i++)
		{
                  	write((int)(i + 1) + ". " + file_name(list[i]) + " " +
                      	      list[i]->name(1) +"("+
                      	      list[i]->query("id")+") is at ");
                  	      where = environment(list[i]);
                  	if (where)
			{
				if (where->query("short"))
				{
					write(where->query("short"));
                      		} else
				{
                          		write(where->short());
                      		}
                      		write("(" + file_name(where) + ")\n");
                  	} else
			{
                      		write("???\n");
                  	}
              	}
        } else
                write("没有找到任何派生物件。\n");

        return  1;
}

int help(object me)
{
	write(@HELP
指令格式: child filename

列出一个文档物件和所有副本。

HELP );
        return 1;
}
