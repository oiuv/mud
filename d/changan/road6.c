inherit  ROOM;

void  create  ()
{
        set("short",  "关洛道");
        set("long",  @LONG
这是一条宽阔笔直的官道，足可容得下十马并驰。往东通向脂粉之都
的扬州，往西则直达洛阳城。
LONG);
        set("exits",  ([
                "east"  :  __DIR__"road7",
                "west"  :  __DIR__"road5",
        ]));

        set("outdoors", "luoyang");
        setup();
        replace_program(ROOM);
}
