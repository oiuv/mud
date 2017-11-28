inherit ROOM;

void create()
{
        set("short", "官道");
        set("long", @LONG
这是一条向南的黄土官道，两旁是一片片绿油油的水田和
悠闲的牧童。大道上人流熙熙攘攘，过往的行人顶着炎炎烈日
满头大汗的匆匆赶路，似乎并无心欣赏这优美的田园风光。
LONG);
        set("outdoors", "kunming");
        set("exits", ([
                "west" : __DIR__"xroad2",
                "east" : __DIR__"xiaoximen",
        ]));
        setup();
        replace_program(ROOM);
}
