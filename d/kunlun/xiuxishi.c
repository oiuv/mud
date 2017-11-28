inherit ROOM;

void create()
{
	set("short", "休息室");
        set("long", @LONG
这是间整洁的厢房，因门窗常闭着，光线很昏暗。房里放
着几张收拾得舒舒服服的木床，看着就让人想睡觉。
LONG);

        set("no_fight", 1);
        set("sleep_room", 1);

        set("exits", ([
	        "south" : __DIR__"liangong",
                "southeast" : __DIR__"chufang",
        ]));

        setup();
        replace_program(ROOM);
}
