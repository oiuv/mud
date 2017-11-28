// depot-ob.c

#include "/clone/misc/depot_ob.h"

string long() 
{
        string msg; 
        
        msg = query("long"); 
        msg += "LONG_DESCRIPTION";
        msg += extra_long();
        
        return sort_string(msg, 64, 0); 
}

void owner_is_killed() { destruct(this_object()); } 