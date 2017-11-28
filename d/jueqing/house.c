inherit ROOM;

void create()
{
        set("short", "小屋");
        set("long", @LONG
这是绝情谷底的一间小茅屋，这里似乎很久没有来过了。
LONG);
        set("exits", ([
               "out"  :  __DIR__"underya2",
        ]));

        if (random(5) == 1)
               set("objects", ([
                      "/d/gumu/obj/fengmi" : 2,
                      	//杨过转移到古墓，还是不要让他和小龙女夫妻分离了:) by 薪有所属
                      //"/kungfu/class/gumu/yang" : 1,
               ]));

        else 
               set("objects", ([
                      "/d/gumu/obj/fengmi" : 2,                      
               ]));

        set("no_clean_up", 0);

        setup();
        replace_program(ROOM);
}
