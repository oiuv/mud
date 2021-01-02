// dump.c (should be admin cmd?)

inherit F_CLEAN_UP;

int main(object me, string arg)
{
    seteuid(geteuid(me));

    dumpallobj();

    write("dump all obj to OBJ_DUMP...ok\n");

    return 1;
}

int help(object me)
{
    write(@HELP
指令格式 : dump

dump the stats of all objects to a file in root dir
named OBJ_DUMP.

HELP
    );
    return 1;
}
