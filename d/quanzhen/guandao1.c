inherit ROOM;

void create()
{
        set("short", "官道");
        set("long", @LONG
这是一条大道，西面通往武功镇，东北方则是长安城。道
上的行人很多，大多是低着头自己赶自己的路。忽然在你的身
后响起得得的马蹄声，不一会儿，几匹骏马从你身边飞驰而过，
掠起了一片黄沙。
LONG);
        set("outdoors", "wugong");
        set("exits", ([
                "west" : __DIR__"guandao2",
                "northeast": "/d/changan/nan-chengmen",
        ]));
        setup();
        replace_program(ROOM);
}
