//ROOM: /d/yanziwu/dannuo.c

inherit ROOM;
void create()
{
        set("short", "啖糯厅");
        set("long",@LONG
这是一间雅致的大厅，厅上摆着几张紫檀木大桌。桌上银
制餐具一应俱全，桌边一溜犁花木椅。每日慕容世家很多人都
在此用餐。
LONG );
        set("exits", ([
            "west" : __DIR__"yimen",
            "east" : __DIR__"huayuan",
        ]));
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
