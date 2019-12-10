inherit ROOM;

void create()
{
        set("short", "厢房");
        set("long", @LONG
这里是红花会总舵内后厅旁的一个厢房，是供给红花会的
弟子所居住的。厢房中央摆着几张大床，几张桌子。室中光线
柔和，使人更增睡意。
LONG);
        set("no_clean_up", 0);
        set("exits", ([
                "west" : __DIR__"hh_zoulang7",
	]));
        set("no_fight",1);
        set("no_steal",1);
        set("sleep_room",1);
        setup();
        replace_program(ROOM);
}
