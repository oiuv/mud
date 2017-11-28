// Room: /t/wanjiegu/stone_room.c

inherit ROOM;
int do_give(object me, object obj, object who);

void create()
{
        set("short", "石屋");
        set("long", @LONG
一间用花岗岩砌成的房子，坚固无比。南面有一个小孔，西边
有一张小床，屋内光线黑暗，又有些潮湿。一人女子正坐在床上不
停地喘气，身上的衣服都被汗水湿透了。
LONG
        );
        set("exits", ([ /* sizeof() == 1 */
            "south" : __DIR__"backyard",
        ]));
        set("objects", ([ /* sizeof() == 1 */
            __DIR__"npc/mu" : 1,
        ]));
//        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
