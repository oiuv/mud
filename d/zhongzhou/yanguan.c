inherit ROOM;

void create()
{
        set("short", "鸦片馆");
        set("long", @LONG
一下楼梯走进一个大厅，原来这里是一个鸦片馆。大厅放
着大约有几十张躺椅，几个烟鬼躺在躺椅上，旁边还有小
姐帮他做鸦泡。三面靠墙都放着躺椅。
LONG);
       set("exits", ([
                "up" : __DIR__"chalou",
                "east" : __DIR__"danjian",

       ]));
       setup();
}
