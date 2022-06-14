// chinese.c
inherit CORE_CLEAN_UP;

int help(object me);

int main(object me, string arg)
{
    string key, chinz;

    if (!wizardp(me))
        return 0;

    if (!arg || arg == "")
    {
        return help(me);
    }

    if (arg == "-dump")
    {
        CHINESE_D->dump_translate();
        write("CHINESE_DUMP!\n");
        return 1;
    }

    if (sscanf(arg, "-d %s", key))
    {
        CHINESE_D->remove_translate(key);
        write(sprintf("删除字典 %s.\n", key));
        return 1;
    }

    if (sscanf(arg, "%s to %s", key, chinz) == 2)
    {
        CHINESE_D->add_translate(key, chinz);
        write(key + " <==> " + chinz + "！\n");
        return 1;
    }
    else
    {
        write(sprintf("%s 翻译结果为 %s。\n",
                      arg, chinese(arg)));
    }

    return 1;
}

int help(object me)
{
    if (!wizardp(me))
        return 0;

    write(@HELP
查询、设置中英文字典，或导出字典到 CHINESE_DUMP 文件。

指令格式：chinese <英文>
      或  chinese <英文> to <中文>
      或  chinese -d <英文>
      或  chinese -dump
HELP );
    return 1 ;
}
