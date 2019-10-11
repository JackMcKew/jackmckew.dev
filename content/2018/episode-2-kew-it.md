Title: Episode 2 - Kew-It
Date: 2018-11-30 03:08
Author: admin
Tags: data, thesis
Slug: episode-2-kew-it
Status: published

Yesterday, I submitted my Electrical Engineering honours thesis.

My project consisted of creating a hardware/software solution to schedule appliances in home to minimize energy costs through time of use pricing.

The hardware is a "black box" that monitors power usage of appliances and logs this data through Wi-Fi to a database hosted locally.

The software utilized an multi-objective evolutionary algorithm to then determine what the most beneficial time for each of the appliances to run. By using python for these computations, directly when the results are determined, a control strategy sends control messages back out to the "black boxes" to control the appliances automatically.

By scheduling appliances in this manner, showed up to 50% reduction in cost of energy daily. As this can be scaled to any size of implementation, this project could show significant savings in cost of energy for any building/business. The project has an estimated payback period of 5 months, comparable to that of solar with 4-5 years.
