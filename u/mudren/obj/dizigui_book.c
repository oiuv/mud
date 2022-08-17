#include <ansi.h>

inherit ITEM;

void create()
{
    set_name(CYN "弟子规" NOR, ({"dizi gui", "book", "gui"}));
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", CYN @LONG
    《弟子规》，原名《训蒙文》，是清朝李毓秀所作的三言韵文，约作于
康熙年间；后经贾存仁（一说贾有仁）修订改编，命名为《弟子规》。该文
共为五个部分，其首章“总叙”将孔子的话，用三字句改编而成，正文分为“
入则孝，出则悌”“谨而信”“泛爱众，而亲仁”“行有余力，则以学文”共四个部
分，进行了具体、通俗的闸释；主要列举了为人子弟在家、外出，待人、接
物、处世、求学时应有的礼仪规范。有兴趣可以读读(指令：read dizi gui)。
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
    if (arg != "dizi gui")
    {
        return 0;
    }
    else
    {
        string f = read_file(__DIR__"book/dizigui.json");
        mapping c = element_of(json_decode(f)["content"]);
        msg("info", sprintf("$ME开始阅读《弟子规》『%s』部分的内容。\n", c["chapter"]), this_player());
        foreach(string line in c["paragraphs"])
        {
            write("\t" + line + "\n");
        }

        return 1;
    }
}
