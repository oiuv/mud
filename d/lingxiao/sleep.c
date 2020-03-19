inherit ROOM;

void create()
{
        set("short", "休息室");
        set("long", @LONG
这是间整洁的厢房，门窗常闭，光线昏暗。房里别无他物，
只有两边放着几张收拾得舒舒服服的大床，看着就让人想睡觉。
LONG );
        set("sleep_room", 1);
        set("no_clean_up", 0); 
        set("no_fight", 1);
        set("exits", ([
                "east" : __DIR__"zoulang1",
        ]));
        setup();
        replace_program(ROOM);
}

