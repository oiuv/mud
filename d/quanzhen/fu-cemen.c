inherit ROOM;

void create()
{
        set("short", "富家侧门");
        set("long", @LONG
这里是一道小门，可能是由于怕进出不方便而修建的。门
虽然小，但还修饰得人模人样，门上嵌着两个大铜环。几条大
狼狗懒洋洋躺在门边，一看见有人进来就汪汪地乱吠。出了门
就是武功镇的南街了，进门后是富家的小院。
LONG);
        set("exits", ([
                "northwest" : __DIR__"nanjie",
                "east" : __DIR__"fu-xiaoyuan",
        ]));
        set("objects", ([
                "/clone/quarry/gou2" : 2,
        ]));
        setup();
        replace_program(ROOM);
}
