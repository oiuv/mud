inherit ROOM;

void create()
{
        set("short", "黄土路");
        set("long", @LONG
这是一条向南的黄土大道，两旁是一片片绿油油的水田和
悠闲的牧童。大道上人流熙熙攘攘，过往的行人顶着炎炎烈日
满头大汗的匆匆赶路，似乎并无心欣赏这优美的田园风光。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "south" : __DIR__"htroad2",
                "north" : __DIR__"nanmen",
        ]));
        setup();
        replace_program(ROOM);
}
