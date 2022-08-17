#include <ansi.h>

inherit ITEM;

void create()
{
    set_name(CYN "诗经" NOR, ({"shi jing", "book", "shi", "jing"}));
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", CYN @LONG
    《诗经》，是中国古代诗歌的开端，最早的一部诗歌总集，收集了西周
初年至春秋中叶（前11世纪至前6世纪）的诗歌，共311篇，有兴趣可以读读
(指令：read shi jing)。
LONG NOR);
        set("unit", "本");
        set("no_get", "这是公共图书，你还是别拿走的好。\n");
        set("material", "paper");
    }
}

void init()
{
    add_action("do_read", "read");
}

int do_read(string arg)
{
    if (arg != "shi jing")
    {
        return 0;
    }
    else
    {
        string f = read_file(__DIR__ "book/shijing.json");
        mapping c = element_of(json_decode(f));

        msg("info", sprintf("$ME开始阅读《诗经》『%s』篇『%s』章节的诗歌《%s》。\n", c["chapter"], c["section"], c["title"]), this_player());
        foreach (string line in c["content"])
        {
            write("\t" + line + "\n");
        }

        return 1;
    }
}
