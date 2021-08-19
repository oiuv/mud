
#include <room.h>
#include <ansi.h>

inherit ROOM;

void create()
{
    set("short", HIW "英雄圣殿" NOR);
//     set("long", HIY "\n\n"
// "       古   一   惯   白   几   青   是   浪   滚\n"
// "       今   壶   看   发   度   山   非   花   滚\n"
// "       多   浊   秋   渔   夕   依   成   淘   长\n"
// "       少   酒   月   樵   阳   旧   败   尽   江\n"
// "       事   喜   春   江   红   在   转   英   东\n"
// "       都   相   风   渚             头   雄   逝\n"
// "       付   逢        上             空        水\n"
// "       笑                                        \n"
// "       谈                                        \n"
// "       中                                        \n\n" NOR
//        );
    set("long",@LONG
    滚滚长江东逝水，浪花淘尽英雄。\n
    是非成败转头空。\n
    青山依旧在，几度夕阳红。\n
    白发渔樵江渚上，惯看秋月春风。\n
    一壶浊酒喜相逢。\n
    古今多少事，都付笑谈中。
LONG);
    set("exits", (["enter":__DIR__ "hall",
                       "up":"/d/city/wumiao",
                     "west":__DIR__ "wenxuan",
    ]));

    set("no_fight", 1);

    setup();
       replace_program(ROOM);
}
