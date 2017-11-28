#include <ansi.h>
#include <command.h>

inherit ROOM;

int do_look(string arg); 

void create()
{
    set("short", "英雄会馆后厅");
    set("long", @LONG
英雄会馆乃是佛山大豪「南霸天」凤天南的家业。常来这
里的人，都是有能耐有来头的。现在英雄会馆里正围着黑压压
的一大群人，都是来自各地的知名商贾。凤天南座于中堂，犀
利的目光似乎要把你刺透一般。西墙挂着的牌子 (paizi)上面
写着此次拍卖大会的规则，一定要好好看看。
LONG);
        set("no_fight", 1);
        set("no_sleep", 1);

        set("exits", ([
                "north" : __DIR__"pm_restroom",
        ]));

        setup();
        "/adm/npc/feng"->come_here();
}

void init()
{
        object me = this_player();

        if (wiz_level(me) >= 3
           && ! me->query_temp("to_pmc"))
        {
                tell_object(me, WHT "\n凤天南在你的耳边悄声说道：巫师操"
                                "作手册(" HIY "board" NOR + WHT ")就在这"
                                "里，你老人家可以看看。\n\n" NOR);
                me->set_temp("to_pmc", 1);
        }
        add_action("do_look", "look");
}

int do_look(string arg)
{ 
        object me = this_player();

        if (arg != "paizi" && arg != "board")
                return 0;

        if (arg == "paizi")
                return HELP_CMD->main(me, "pm1");
        else
                return HELP_CMD->main(me, "pm2");
}
