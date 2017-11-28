inherit ROOM;

void create()
{
        set("short", "小院");
        set("long", @LONG
这里是寺内的小院，收拾的相当干净利索。来来往往的香
客和喇嘛，一边在暗示着大轮寺香火之盛，一边也好象在表示
喇嘛的口福也真不坏。因为北边就是个厨房。
LONG);
        set("outdoors", "xueshan");
        set("exits", ([
                "west" : __DIR__"guangchang",
                "north" : __DIR__"chufang",
        ]));
        setup();
        replace_program(ROOM);
}
