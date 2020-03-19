
inherit ROOM;

void create()
{
        set("short", "练武厅");
        set("long", @LONG
这里是凌霄城的练武场。只见刀光剑影，目不暇接，一群凌
霄弟子练得大汗淋漓，彼此打得难解难分。凌霄城里因派系不和，
彼此间明争暗斗，门下弟子也只得努力练功，以防不测。
LONG );
        set("exits", ([
            "west"      : __DIR__"fudian2",
        ]));
        set("outdoors", "lingxiao" );
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}

