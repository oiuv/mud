#include <room.h>
inherit "/d/xingxiu/shamo";

int valid_leave(object me, string dir)
{
//      string dest;

       	if (dir == "east")
        {
                if (me->add_temp("out_shamo", 1) >= 3)
                {
             	    	me->move("/d/xingxiu/silk4");
                     	write("你累得半死，终於走出了沙漠。\n");
        		return -1;
                }
        }

        return ::valid_leave(me, dir);
}