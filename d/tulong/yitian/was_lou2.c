#include <ansi.h>

inherit ROOM;

void create()
{
        set("short", "万安寺第二层");
        set("long", @LONG
这里是万安寺的第二层，寺楼里站着几个身着火红袈裟的和尚。一见你上楼，
立马向你扑来。
LONG );
        set("exits", ([
            "down"  : "/d/tulong/yitian/was_houdian",
            "up"    : "/d/tulong/yitian/was_lou3",
        ]));

        set("objects", ([
            "/d/tulong/yitian/npc/18jingang-4zhang" :4,
        ]));
        setup();
}
int valid_leave(object me, string dir)
{
        if (dir == "up" && objectp(present("zhang seng", environment(me))))
           return notify_fail(CYN "杖僧齐声喝道：哪里走？滚下来！\n" NOR);

        if (dir == "down" && objectp(present("zhang seng", environment(me))))
           return notify_fail(CYN "杖僧齐声喝道：哪里逃？纳命来！\n" NOR);

        return ::valid_leave(me, dir);
}


void reset()
{
        object ob;

        ::reset();

        foreach (ob in all_inventory(this_object()))
        {
                if (ob->is_character() ||
                    ob->is_head() ||
                    ob->is_corpse() ||
                    ob->query("no_get"))
                        continue;
                destruct(ob);
        }
        
        return;
}

