//Room: /d/dali/xiuxishi.c
//Date: June. 29 1998 by Java

inherit ROOM;
void create()
{
	set("short", "厢房");
	set("long", @LONG
这是间整洁的厢房，因门窗常闭着，光线很昏暗。房里别无他物，
只有中间放着几张收拾得舒舒服服的大床，看着就让人想睡觉。这里
是休息的地方，有时候练功累了，段家弟子也会在这里休息。
LONG);
	set("exits",([ /* sizeof() == 1 */
	    "north"  : __DIR__"chahua1",
	]));
        set("sleep_room", 1);
        set("no_fight", 1);
	setup();
	replace_program(ROOM);
}
