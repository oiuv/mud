// pet.c

#include "/clone/npc/pet.h"

void setup()
{
        set_name("PET_NAME", ({"PET_ID"}));        
        set("gender", "PET_GENDER");                
        set("unit", "PET_UNIT");
        set("long", "LONG_DESCRIPTION");
        set_temp("owner", "OWNER_ID");
        set_temp("owner_name", "OWNER_NAME");
        ::setup();
}

