#ifndef __NAME_H__
#define __NAME_H__

string *select_a(mapping p, string except)
{
        int i;
        int r;  
        int total;
        string *kp;

        kp = keys(p);
        for (total = 0, i = 0; i < sizeof(kp); i++)
                total += sizeof(p[kp[i]]);
        for (;;)
        {
                r = random(total);
                for (i = 0; i < sizeof(kp); i++)
                {
                        if (r < sizeof(p[kp[i]]))
                                break;
                        r -= sizeof(p[kp[i]]);
                }
                if (! except || strsrch(except, kp[i]) == -1)
                        break;
        }
        r &= 0xFFFE;
        return ({ kp[i], p[kp[i]][r..r+1] });
}

#endif
