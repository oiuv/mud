inherit ROOM;
 
void create()
{
        set("short", "蓝天");
        set("long", @LONG
四周是蓝蓝的天，洁白的云在飘；地上的行人看起来象蚂
蚁。你心中有一种感觉：君临天下一览人间小。
LONG);   
        set("outdoors", "taohua");
        set("no_clean_up", 0);
        setup();
        replace_program(ROOM);
}
