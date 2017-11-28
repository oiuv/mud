inherit ROOM;

void create()
{
        set("short", "小村口");
        set("long", @LONG
这里是桃花江边的一个小村，村口有几个农家的小孩正在大树底
下玩耍。远远的升起缕缕炊烟，忙碌了一天的人们开始做饭了。 
LONG);
        set("outdoors", "wudujiao");

        set("exits", ([
                "east" : __DIR__"cun2",
                "west" : __DIR__"jiang2",
        ]));
        set("objects", ([
                 __DIR__"npc/kid": 3,
        ]));
    
        setup();
}
