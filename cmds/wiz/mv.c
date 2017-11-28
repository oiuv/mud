// mv.c
// updated by doing
 
inherit F_CLEAN_UP;
 
int main(object me, string arg)
{
        string src, dst;
 
        if (! SECURITY_D->valid_grant(me, "(arch)"))
                return 0;

        seteuid(geteuid(me));
        if (! arg || sscanf(arg, "%s %s", src, dst) != 2)
		return notify_fail("指令格式: mv <原档名> <目标档名> \n");
 
        src = resolve_path(me->query("cwd"), src);
        dst = resolve_path(me->query("cwd"), dst);
 
        if (file_size(src) == -1)
                return notify_fail("源文件名字错误。\n");

        if (! rename(src, dst))
                write("Ok.\n");
        else
                write("你没有足够的读写权利。\n");
        return 1;
}
 
int help(object me)
{
        write(@HELP
指令格式 : mv <原档名> <目标档名>
 
此指令可让你修改某个档案或目录名称。

see also: cp, rm
HELP );
    return 1;
}
