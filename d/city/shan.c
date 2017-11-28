#include <ansi.h>
inherit ROOM;

string look_duilian();

void create()
{
        set("short", "西花扇庄");
        set("long", @LONG
西花扇庄是全国最大的扇行，扇子全是从苏州运来。这里
出售的扇子不仅种类繁多，款式质量面料都非常精致。这些团
扇宫扇也是苏州府每年进贡的物品。来扬州的游客都不忘光顾
此处参观购买旅游纪念品。门口挂着幅烫金对联(lian)，宽敞
明亮的店堂里陈列满各种纱丝、绸缎、锦、绢绡、羽毛、檀香
木质地的扇样，当真是琳琅满目。
LONG );
        set("item_desc", ([
                "lian" : (: look_duilian :),
        ]));
        set("exits", ([
                "north" : __DIR__"xidajie1",
        ]));
        set("objects", ([
                __DIR__"npc/liususu": 1,
        ]));
        setup();

        //replace_program(ROOM);
}

string look_duilian()
{
        return
        HIC "\n"
        "          ※※※※※※※            ※※※※※※※\n"
        "          ※※※※※※※            ※※※※※※※\n"
        "          ※※      ※※            ※※      ※※\n"
        "          ※※" HIW "　舞　" HIC "※※            ※※" HIW "  歌  " HIC "※※\n"
        "          ※※　 　 ※※            ※※      ※※\n"
        "          ※※" HIW "  低  " HIC "※※            ※※" HIW "  尽  " HIC "※※\n"
        "          ※※      ※※            ※※      ※※\n"
        "          ※※" HIW "  杨  " HIC "※※            ※※" HIW "  桃  " HIC "※※\n"
        "          ※※      ※※            ※※      ※※\n"
        "          ※※" HIW "  柳  " HIC "※※            ※※" HIW "  花  " HIC "※※\n"
        "          ※※      ※※            ※※      ※※\n"
        "          ※※" HIW "  搂  " HIC "※※            ※※" HIW "  扇  " HIC "※※\n"
        "          ※※    　※※            ※※      ※※\n"
        "          ※※" HIW "  心  " HIC "※※            ※※" HIW "  底  " HIC "※※\n"
        "          ※※    　※※            ※※      ※※\n"
        "          ※※" HIW "  月  " HIC "※※            ※※" HIW "  风  " HIC "※※\n"
        "          ※※    　※※            ※※      ※※\n"
        "          ※※※※※※※            ※※※※※※※\n"
        "          ※※※※※※※            ※※※※※※※\n\n" NOR;
}
