#include <ansi.h>

inherit ITEM;

void create()
{
    set_name(CYN "千家诗" NOR, ({"qianjia shi", "book", "shi"}));
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", CYN @LONG
    《千家诗》是由宋代谢枋得《重订千家诗》（皆七言律诗）和清代王相
所选《五言千家诗》合并而成。它是我国旧时带有启蒙性质的诗歌选本。因
为它所选的诗歌大多是唐宋时期的名家名篇，易学好懂，题材多样：山水田
园、赠友送别、思乡怀人、吊古伤今、咏物题画、侍宴应制。有兴趣可读读
(指令：read qianjia shi)。
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
    if (arg != "qianjia shi")
    {
        return 0;
    }
    else
    {
        string f = read_file(__DIR__"book/qianjiashi.json");
        mapping c = element_of(json_decode(f)["content"]);
        mapping p = element_of(c["content"]);
        msg("info", sprintf("$ME开始阅读《千家诗》的%s《%s》（作者：%s）。\n", c["type"], p["chapter"], p["author"]), this_player());
        foreach(string line in p["paragraphs"])
        {
            write("\t" + line + "\n");
        }

        return 1;
    }
}
