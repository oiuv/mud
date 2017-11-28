// which.c 
inherit F_CLEAN_UP;
int main(object me, string arg)
{
      string file;
        if (! SECURITY_D->valid_grant(me, "(wizard)"))
        return 0;
        if(!arg)
                return notify_fail("指令格式：which <命令>\n");
      file=me->find_command(arg);
        if(!file)
                write("没有找到 "+arg+" 这个命令。\n");
        else
                write(file+"\n" );
        return 1;
}
int help()
{
        write(@TEXT
指令格式：which <命令>
这个指令可以找到某个命令在什么目录。
TEXT
        );
        return 1;
}

