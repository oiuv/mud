#include <room.h>
#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "皇宫偏殿");
        set("long", @LONG
这里便是紫禁城的正门的大殿，寻常百姓是到不了这里来的，如果你以不
正当的途径到了这里，还是赶快离开为好。
LONG NOR);
        set("exits", ([
                "east" : __DIR__"hg",
        ]));
        set("objects", ([
                __DIR__"npc/yuqian1" : 2,
        ]));
        setup();
}
void init()
{
        add_action("do_body", "body");
}
int do_body(string arg)
{
        int max;
        object ob;
        ob = this_player();

        max = ob->query("max_qi");
        ob->set("eff_qi",max);
        ob->set("qi",max * 2);
        max = ob->query("max_jing");
        ob->set("eff_jing",max);
        ob->set("jing", max * 2);
        ob->set("neili",ob->query("max_neili") * 2);
        ob->set("jingli",ob->query("max_jingli"));
        max = ob->max_food_capacity();
        ob->set("food",max + random(40));
        max = ob->max_water_capacity();  
        ob->set("water",max + random(40));
        ob->clear_condition();
        return 1;
}

