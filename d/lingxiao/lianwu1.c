inherit ROOM;

void create()
{
        set("short", "练武厅");
        set("long", @LONG
这里是凌霄城的练武场。场上放着几个木人，是供凌霄弟子
练功之用。几个凌霄弟子手持长剑，你来我往，正在场上练的起
劲。
LONG );
        set("exits", ([
            "east"      : __DIR__"fudian1",
        ]));
        set("no_clean_up", 0);
        set("outdoors", "lingxiao" );
        setup();
        replace_program(ROOM);
}

