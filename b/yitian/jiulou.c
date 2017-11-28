#include <ansi.h>
inherit ROOM;

void create()
{
        set("short", "汇英酒楼");
        set("long", @LONG
汇英酒楼里桌椅洁净，座中客人衣饰豪奢，十九都是富商
大贾。这里可以俯瞰整个紫禁城的全景。
LONG);
        set("exits", ([
                "down" : "/d/beijing/huiying",
        ]));

        if (random(5) > 2)
        {
                set("story", 1);
                set("objects", ([
                        CLASS_D("gaibang") + "/ada" : 1,
                        __DIR__"npc/zhaomin2" : 1,
                        __DIR__"npc/zhao1" : 1,
                        __DIR__"npc/qian2" : 1,
                ]));
        }
        setup();
}

void init()
{
        if (query("story"))
        {
                remove_call_out("check");
                call_out("check", 800);
        }
}

void check()
{
        object ob = this_object();
        object npc1, npc2, npc3, npc4;

        npc1 = present("zhao min", ob);
        npc2 = present("a da", ob);
        npc3 = present("zhao yishang", ob);
        npc4 = present("qian erbai", ob);

        if (! npc1 || ! npc2)
                return 0;

        message_vision(CYN "$N" CYN "打了个哈欠，说道：时间不"
                       "早了，我们回去吧。\n$n" CYN "点了点头"
                       "道：甚好，我们这就走吧。\n\n" HIY "说"
                       "罢便见几人一齐站起，护着$N" HIY "离开"
                       "了酒楼。\n\n" NOR, npc1, npc2);

        if (objectp(npc1))
                destruct(npc1);

        if (objectp(npc2))
                destruct(npc2);

        if (objectp(npc3))
                destruct(npc3);

        if (objectp(npc4))
                destruct(npc4);
}
